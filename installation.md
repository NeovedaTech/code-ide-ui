### JUDGE 0 API INSTALLATION

#### Operating System

```
ubuntu 22.04 lts
```

#### Instance Type

```
( EC2 , VM Engine depending on the plaform you ara using )
As per usecase ex m5.4x large moderate traffic, m5.large low traffic , m5.12xlarge high server load
```

#### Installation

- Set up commands on new server

```
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg lsb-release ufw
```

- Docker installation

```
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

docker --version
docker compose version

sudo usermod -aG docker $USER
newgrp docker

```

#### NGINX Intsallation

##### To proxy incoming requests to Judge0 Api

```
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
systemctl status nginx
```

##### Allow firewalls

```
sudo apt update
sudo apt install -y ufw

sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

### Installation Commands

1. Use sudo to open file /etc/default/grub
2. Add systemd.unified_cgroup_hierarchy=0 in the value of GRUB_CMDLINE_LINUX variable.
3. Apply the changes: sudo update-grub
4. Restart your server: sudo reboot

- Repo setup

```
wget https://github.com/judge0/judge0/releases/download/v1.13.1/judge0-v1.13.1.zip
unzip judge0-v1.13.1.zip
```

- ENVIORNMENT SETUP

1. nano judge0.conf
2. update env as per your usecase
3. JUDGE0 PASS & REDIS PASS ARE MANDATORY TO UPDATE

```
cd judge0-v1.13.1
docker-compose up -d db redis
sleep 10s
docker-compose up -d
sleep 5s
```
