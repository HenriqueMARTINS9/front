# Guide de Déploiement VirtualSomm

## 🚀 Vue d'ensemble

Ce guide décrit les étapes pour déployer l'application VirtualSomm Frontend sur un serveur de production.

## 📋 Prérequis

### Serveur de production
- **OS** : Ubuntu 20.04+ ou CentOS 8+
- **RAM** : Minimum 2GB, recommandé 4GB+
- **CPU** : 2 cores minimum
- **Stockage** : 20GB minimum
- **Node.js** : Version 18.x ou supérieure
- **Docker** : Version 20.10+ (optionnel)
- **Nginx** : Pour le reverse proxy (recommandé)

### Domaine et SSL
- Nom de domaine configuré
- Certificat SSL (Let's Encrypt recommandé)

## 🔧 Méthode 1 : Déploiement avec Docker (Recommandé)

### 1. Préparation du serveur

```bash
# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installation de Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Installation de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Clonage et configuration

```bash
# Cloner le repository
git clone <your-repository-url> /var/www/virtualsomm
cd /var/www/virtualsomm/front

# Configuration des variables d'environnement
cp .env.example .env.production
nano .env.production
```

**Fichier `.env.production` :**
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.virtualsomm.ch
OAUTH_CLIENT_ID=250684173847-7f1vs6bi5852mel1k2ddogijlrffemf8.apps.googleusercontent.com
OAUTH_CLIENT_SECRET=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
NEXT_TELEMETRY_DISABLED=1
```

### 3. Configuration Nginx

```bash
# Configuration du reverse proxy
sudo nano /etc/nginx/sites-available/virtualsomm
```

**Fichier `/etc/nginx/sites-available/virtualsomm` :**
```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votre-domaine.com www.votre-domaine.com;

    # Certificats SSL
    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Headers de sécurité
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy vers l'application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache pour les assets statiques
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/virtualsomm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Déploiement avec Docker

```bash
# Build et démarrage des conteneurs
docker-compose -f docker-compose.prod.yml up -d --build

# Vérifier les logs
docker logs virtualsomm-prod

# Vérifier que l'application fonctionne
curl http://localhost:3000
```

### 5. Configuration des certificats SSL

```bash
# Installation de Certbot
sudo apt install certbot python3-certbot-nginx

# Obtention du certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Test de renouvellement automatique
sudo certbot renew --dry-run
```

## 🔧 Méthode 2 : Déploiement Manuel (Node.js)

### 1. Installation de Node.js

```bash
# Installation de Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérification
node --version
npm --version
```

### 2. Installation de PM2

```bash
# Installation globale de PM2
sudo npm install -g pm2

# Configuration du démarrage automatique
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 3. Build et déploiement

```bash
# Installation des dépendances
npm ci --only=production

# Build de l'application
npm run build

# Configuration PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'virtualsomm-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/virtualsomm/front',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/virtualsomm-error.log',
    out_file: '/var/log/pm2/virtualsomm-out.log',
    log_file: '/var/log/pm2/virtualsomm.log'
  }]
}
EOF

# Démarrage avec PM2
pm2 start ecosystem.config.js
pm2 save
```

## 🔄 Script de Déploiement Automatisé

### Création du script de déploiement

```bash
# Créer le script
nano deploy.sh
chmod +x deploy.sh
```

**Contenu du script `deploy.sh` :**
```bash
#!/bin/bash

# Configuration
REPO_URL="https://github.com/your-username/virtualsomm.git"
DEPLOY_PATH="/var/www/virtualsomm"
BRANCH="main"

echo "🚀 Début du déploiement VirtualSomm..."

# Arrêt de l'application
echo "⏹️ Arrêt de l'application..."
docker-compose -f $DEPLOY_PATH/front/docker-compose.prod.yml down || true

# Mise à jour du code
echo "📥 Mise à jour du code..."
cd $DEPLOY_PATH
git fetch origin
git reset --hard origin/$BRANCH
git clean -fd

# Déploiement
echo "🔨 Build et démarrage..."
cd $DEPLOY_PATH/front
docker-compose -f docker-compose.prod.yml up -d --build

# Vérification
echo "✅ Vérification du déploiement..."
sleep 30
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Déploiement réussi!"
else
    echo "❌ Erreur de déploiement!"
    docker logs virtualsomm-prod --tail 50
    exit 1
fi

echo "🎉 Déploiement terminé avec succès!"
```

## 📊 Monitoring et Maintenance

### 1. Surveillance des logs

```bash
# Logs Docker
docker logs virtualsomm-prod -f

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs système
journalctl -u docker -f
```

### 2. Métriques et santé

```bash
# Statut des conteneurs
docker ps
docker stats

# Utilisation des ressources
htop
df -h
free -m
```

### 3. Sauvegarde

```bash
# Script de sauvegarde
cat > backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/virtualsomm"
mkdir -p $BACKUP_DIR

# Sauvegarde du code
tar -czf $BACKUP_DIR/code_$DATE.tar.gz -C /var/www virtualsomm

# Sauvegarde des logs
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz /var/log/nginx /var/log/pm2

# Nettoyage des anciennes sauvegardes (garde 7 jours)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Sauvegarde terminée: $DATE"
EOF

chmod +x backup.sh

# Programmation quotidienne
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/virtualsomm/backup.sh") | crontab -
```

## 🔄 Mise à jour

### Mise à jour manuelle

```bash
cd /var/www/virtualsomm/front
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
```

### Mise à jour automatisée

```bash
# Script de mise à jour
cat > update.sh << EOF
#!/bin/bash
cd /var/www/virtualsomm/front
git pull origin main
if [ $? -eq 0 ]; then
    docker-compose -f docker-compose.prod.yml up -d --build
    echo "✅ Mise à jour réussie"
else
    echo "❌ Erreur lors de la mise à jour"
    exit 1
fi
EOF

chmod +x update.sh
```

## 🚨 Dépannage

### Problèmes courants

1. **L'application ne démarre pas**
   ```bash
   docker logs virtualsomm-prod
   docker-compose -f docker-compose.prod.yml logs
   ```

2. **Erreurs de permissions**
   ```bash
   sudo chown -R $USER:$USER /var/www/virtualsomm
   ```

3. **Problèmes de certificat SSL**
   ```bash
   sudo certbot renew --force-renewal
   sudo systemctl reload nginx
   ```

4. **Manque de mémoire**
   ```bash
   # Augmenter la swap
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

### Commandes de diagnostic

```bash
# Vérifier les ports
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Vérifier les processus
ps aux | grep node
ps aux | grep nginx
ps aux | grep docker

# Vérifier l'espace disque
df -h
du -sh /var/www/virtualsomm
```

## 📞 Support

En cas de problème lors du déploiement :

1. **Vérifier les logs** de l'application et du serveur web
2. **Consulter la documentation** API
3. **Contacter le support** technique

---

**Note** : Remplacez `votre-domaine.com` par votre nom de domaine réel dans tous les fichiers de configuration.
