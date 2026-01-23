#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: ./deploy.sh [COMMAND] [ENV]"
    echo ""
    echo "Commands:"
    echo "  up [dev|release|prod]     - Deploy environment"
    echo "  down [dev|release|prod]   - Stop environment"
    echo "  logs [dev|release|prod]   - Show logs"
    echo "  status [dev|release|prod] - Show status"
    echo "  restart [dev|release|prod] - Restart services"
    echo "  build [dev|release|prod]  - Build images"
    echo "  rebuild [dev|release|prod] - Rebuild images without cache"
    echo ""
    echo "Examples:"
    echo "  ./deploy.sh up dev      # Deploy development environment"
    echo "  ./deploy.sh build prod  # Build production images"
    echo "  ./deploy.sh logs release # Show release logs"
    echo "  ./deploy.sh down prod   # Stop production"
    exit 1
}

# Validate environment
validate_env() {
    local env=$1
    if [[ "$env" != "dev" && "$env" != "release" && "$env" != "prod" ]]; then
        print_error "Invalid environment: $env"
        show_usage
    fi
}

# Check if .env file exists
check_env_file() {
    local env=$1
    local env_file="deployments/$env/.env"

    if [[ ! -f "$env_file" ]]; then
        print_warning "Environment file not found: $env_file"
        print_info "Continuing without environment file (using .env from project root if available)"
    fi
}

# Get compose command and files
get_compose_cmd() {
    local env=$1
    if [[ -f "deployments/$env/.env" ]]; then
        echo "docker compose -f deployments/$env/docker-compose.yml --env-file deployments/$env/.env"
    else
        echo "docker compose -f deployments/$env/docker-compose.yml"
    fi
}

# Get environment URL
get_env_url() {
    local env=$1
    case $env in
        dev)
            echo "http://localhost:3030"
            ;;
        release)
            echo "https://cortexone-internal.rival.io:3131"
            ;;
        prod)
            echo "https://cortexone.rival.io"
            ;;
    esac
}

# Deploy environment
deploy_up() {
    local env=$1
    check_env_file "$env"

    print_info "Deploying $env environment..."

    local compose_cmd=$(get_compose_cmd "$env")

    # Build and start services
    print_info "Building images..."
    eval "$compose_cmd build"

    print_info "Starting services..."
    eval "$compose_cmd up -d"

    print_success "$env environment deployed successfully!"

    # Show status
    echo ""
    print_info "Service status:"
    eval "$compose_cmd ps"

    # Show URL
    local url=$(get_env_url "$env")
    print_success "Application available at: $url"
}

# Stop environment
deploy_down() {
    local env=$1

    print_info "Stopping $env environment..."

    local compose_cmd=$(get_compose_cmd "$env")
    eval "$compose_cmd down"

    print_success "$env environment stopped!"
}

# Show logs
deploy_logs() {
    local env=$1
    check_env_file "$env"

    print_info "Showing $env logs (Press Ctrl+C to exit)..."

    local compose_cmd=$(get_compose_cmd "$env")
    eval "$compose_cmd logs -f"
}

# Show status
deploy_status() {
    local env=$1

    print_info "$env environment status:"

    local compose_cmd=$(get_compose_cmd "$env")
    eval "$compose_cmd ps"
}

# Restart services
deploy_restart() {
    local env=$1
    check_env_file "$env"

    print_info "Restarting $env environment..."

    local compose_cmd=$(get_compose_cmd "$env")
    eval "$compose_cmd restart"

    print_success "$env environment restarted!"
}

# Build images
deploy_build() {
    local env=$1
    check_env_file "$env"

    print_info "Building $env images..."

    local compose_cmd=$(get_compose_cmd "$env")
    eval "$compose_cmd build"

    print_success "$env images built successfully!"
}

# Rebuild images without cache
deploy_rebuild() {
    local env=$1
    check_env_file "$env"

    print_info "Rebuilding $env images without cache..."

    local compose_cmd=$(get_compose_cmd "$env")
    eval "$compose_cmd build --no-cache"

    print_success "$env images rebuilt successfully!"
}

# Main logic
if [[ $# -lt 1 ]]; then
    show_usage
fi

COMMAND=$1
ENV=$2

case $COMMAND in
    up)
        if [[ -z "$ENV" ]]; then
            print_error "Environment required for 'up' command"
            show_usage
        fi
        validate_env "$ENV"
        deploy_up "$ENV"
        ;;
    down)
        if [[ -z "$ENV" ]]; then
            print_error "Environment required for 'down' command"
            show_usage
        fi
        validate_env "$ENV"
        deploy_down "$ENV"
        ;;
    logs)
        if [[ -z "$ENV" ]]; then
            print_error "Environment required for 'logs' command"
            show_usage
        fi
        validate_env "$ENV"
        deploy_logs "$ENV"
        ;;
    status)
        if [[ -z "$ENV" ]]; then
            print_error "Environment required for 'status' command"
            show_usage
        fi
        validate_env "$ENV"
        deploy_status "$ENV"
        ;;
    restart)
        if [[ -z "$ENV" ]]; then
            print_error "Environment required for 'restart' command"
            show_usage
        fi
        validate_env "$ENV"
        deploy_restart "$ENV"
        ;;
    build)
        if [[ -z "$ENV" ]]; then
            print_error "Environment required for 'build' command"
            show_usage
        fi
        validate_env "$ENV"
        deploy_build "$ENV"
        ;;
    rebuild)
        if [[ -z "$ENV" ]]; then
            print_error "Environment required for 'rebuild' command"
            show_usage
        fi
        validate_env "$ENV"
        deploy_rebuild "$ENV"
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        ;;
esac