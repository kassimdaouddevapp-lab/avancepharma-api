#!/usr/bin/env python3

"""
Script de migration vers Supabase - Version Python
Plus robuste et meilleur gestion d'erreurs que la version bash
"""

import os
import sys
import subprocess
import argparse
import time
from pathlib import Path
import re


def print_section(text):
    print(f"\n📋 {text}")
    print("-" * 60)


def print_success(text):
    print(f"✅ {text}")


def print_error(text):
    print(f"❌ {text}", file=sys.stderr)


def print_info(text):
    print(f"ℹ️  {text}")


def check_prerequisites():
    """Vérifier les prérequis"""
    print_section("Vérification des prérequis")
    
    # Vérifier pg_dump
    try:
        subprocess.run(["pg_dump", "--version"], capture_output=True, check=True)
        print_success("pg_dump trouvé")
    except FileNotFoundError:
        print_error("pg_dump n'est pas installé")
        print_info("Installez PostgreSQL client :")
        print("  Ubuntu/Debian: sudo apt-get install postgresql-client")
        print("  macOS: brew install postgresql")
        return False
    
    # Vérifier psql
    try:
        subprocess.run(["psql", "--version"], capture_output=True, check=True)
        print_success("psql trouvé")
    except FileNotFoundError:
        print_error("psql n'est pas installé")
        return False
    
    # Vérifier docker compose
    try:
        subprocess.run(["docker", "compose", "ps"], capture_output=True, check=True)
        print_success("Docker Compose trouvé")
    except (FileNotFoundError, subprocess.CalledProcessError):
        print_error("Docker Compose n'est pas disponible")
        return False
    
    return True


def load_env_file(env_file: Path):
    """Lire un fichier .env simple et exporter les variables dans os.environ."""
    if not env_file.exists():
        return False

    with env_file.open("r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            match = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)=(.*)$", line)
            if not match:
                continue
            key, value = match.groups()
            value = value.strip().strip('"').strip("'")
            os.environ.setdefault(key, value)
    return True


def load_config():
    """Charger la configuration depuis .supabase.env"""
    print_section("Chargement de la configuration")
    
    env_file = Path(".supabase.env")
    
    if not env_file.exists():
        print_error(f"{env_file} n'existe pas")
        print_info("Créez-le avec : cp .supabase.env.example .supabase.env")
        return None
    
    # Charger le fichier
    if not load_env_file(env_file):
        print_error(f"Impossible de charger {env_file}")
        return None
    
    config = {
        "SUPABASE_HOST": os.getenv("SUPABASE_HOST"),
        "SUPABASE_PORT": os.getenv("SUPABASE_PORT", "5432"),
        "SUPABASE_DB": os.getenv("SUPABASE_DB", "postgres"),
        "SUPABASE_USER": os.getenv("SUPABASE_USER", "postgres"),
        "SUPABASE_PASSWORD": os.getenv("SUPABASE_PASSWORD"),
    }
    
    # Vérifier les valeurs obligatoires
    for key in ["SUPABASE_HOST", "SUPABASE_PASSWORD"]:
        if not config.get(key):
            print_error(f"{key} n'est pas défini dans .supabase.env")
            return None
    
    print_success("Configuration chargée")
    print(f"  Host: {config['SUPABASE_HOST']}")
    print(f"  Port: {config['SUPABASE_PORT']}")
    print(f"  Database: {config['SUPABASE_DB']}")
    print(f"  User: {config['SUPABASE_USER']}")
    
    return config


def test_supabase_connection(config):
    """Tester la connexion à Supabase"""
    print_section("Test de connexion à Supabase")
    
    env = os.environ.copy()
    env["PGPASSWORD"] = config["SUPABASE_PASSWORD"]
    
    try:
        result = subprocess.run(
            [
                "psql",
                "-h", config["SUPABASE_HOST"],
                "-p", config["SUPABASE_PORT"],
                "-U", config["SUPABASE_USER"],
                "-d", config["SUPABASE_DB"],
                "-c", "SELECT version();",
            ],
            env=env,
            capture_output=True,
            text=True,
            timeout=10,
        )
        
        if result.returncode == 0:
            print_success("Connexion à Supabase réussie")
            return True
        else:
            print_error("Impossible de se connecter à Supabase")
            print(result.stderr)
            return False
    except subprocess.TimeoutExpired:
        print_error("Timeout lors de la connexion à Supabase")
        return False
    except Exception as e:
        print_error(f"Erreur : {e}")
        return False


def export_local_database():
    """Exporter la base locale"""
    print_section("Export de la base locale")
    
    dump_file = "avancepharma_local_dump.sql"
    
    try:
        # Vérifier que Docker est en marche
        subprocess.run(
            ["docker", "compose", "up", "-d", "postgres"],
            capture_output=True,
            check=True,
        )
        
        print_info("Attente de PostgreSQL local...")
        time.sleep(3)
        
        # Trouver le conteneur
        result = subprocess.run(
            ["docker", "compose", "ps", "-q", "postgres"],
            capture_output=True,
            text=True,
            check=True,
        )
        
        container_id = result.stdout.strip()
        if not container_id:
            print_error("Conteneur PostgreSQL non trouvé")
            return None
        
        print_info(f"Conteneur trouvé : {container_id[:12]}")
        
        # Export
        print_info("Export de la base...")
        with open(dump_file, "w") as f:
            result = subprocess.run(
                [
                    "docker", "exec", container_id,
                    "pg_dump",
                    "-U", "postgres",
                    "-d", "avancepharma",
                    "--no-owner",
                    "--no-privileges",
                    "--clean",
                    "--if-exists",
                ],
                stdout=f,
                stderr=subprocess.PIPE,
                text=True,
                check=True,
            )
        
        file_size = os.path.getsize(dump_file)
        print_success(f"Export réussi : {dump_file} ({file_size} bytes)")
        return dump_file
    
    except subprocess.CalledProcessError as e:
        print_error(f"Erreur lors de l'export : {e.stderr}")
        return None
    except Exception as e:
        print_error(f"Erreur : {e}")
        return None


def import_to_supabase(config, dump_file):
    """Importer dans Supabase"""
    print_section("Import vers Supabase")
    
    env = os.environ.copy()
    env["PGPASSWORD"] = config["SUPABASE_PASSWORD"]
    
    try:
        print_info(f"Import depuis {dump_file}...")
        
        with open(dump_file, "r") as f:
            result = subprocess.run(
                [
                    "psql",
                    "-h", config["SUPABASE_HOST"],
                    "-p", config["SUPABASE_PORT"],
                    "-U", config["SUPABASE_USER"],
                    "-d", config["SUPABASE_DB"],
                    "-f", "-",
                ],
                stdin=f,
                env=env,
                capture_output=True,
                text=True,
                check=True,
            )
        
        print_success("Import vers Supabase réussi !")
        return True
    
    except subprocess.CalledProcessError as e:
        print_error(f"Erreur lors de l'import : {e.stderr}")
        return False
    except Exception as e:
        print_error(f"Erreur : {e}")
        return False


def cleanup(dump_file):
    """Nettoyer les fichiers temporaires"""
    try:
        if Path(dump_file).exists():
            os.remove(dump_file)
            print_success(f"Fichier dump supprimé : {dump_file}")
    except Exception as e:
        print_error(f"Erreur lors du nettoyage : {e}")


def main():
    parser = argparse.ArgumentParser(description="Migration AvancePharma vers Supabase")
    parser.add_argument("--keep-dump", action="store_true", help="Garder le fichier dump après migration")
    args = parser.parse_args()
    
    print("\n🚀 Migration AvancePharma vers Supabase\n")
    
    # Vérifier les prérequis
    if not check_prerequisites():
        sys.exit(1)
    
    # Charger la config
    config = load_config()
    if not config:
        sys.exit(1)
    
    # Tester la connexion
    if not test_supabase_connection(config):
        sys.exit(1)
    
    # Exporter la base locale
    dump_file = export_local_database()
    if not dump_file:
        sys.exit(1)
    
    # Importer dans Supabase
    if not import_to_supabase(config, dump_file):
        print_error("Migration échouée. Le fichier dump est conservé :")
        print(f"  {dump_file}")
        print("\nVous pouvez le réutiliser pour relancer l'import")
        sys.exit(1)
    
    # Cleanup
    if not args.keep_dump:
        cleanup(dump_file)
    
    # Succès
    print_section("Migration terminée ! 🎉")
    print("\n📋 Prochaines étapes :")
    print("1. Mettre à jour les variables d'environnement dans Railway")
    print("2. Tester l'API en production")
    print("3. Configurer le domaine personnalisé si nécessaire")
    print()


if __name__ == "__main__":
    main()