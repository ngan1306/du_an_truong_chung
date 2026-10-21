# Use Alpine Linux as the base image
FROM alpine:3.20

# Install Ansible and required CI/CD tools
RUN apk add --no-cache\
    ansible\
    openssh-client\
    sshpass\
    curl \
    bash\
    py3-pip \
    python3 \
    git \
    rsync \
    ca-certificates \
    docker-cli \
    docker-cli-compose

# Create the working directory
WORKDIR /workspace

# Configure SSH permissions
RUN mkdir -p /root/.ssh && chmod 700 /root/.ssh

# Verify installed tools
RUN ansible --version &&\
    python3 --version &&\
    ssh -V &&\
    docker --version

# Keep the container running
CMD ["sleep", "infinity"]