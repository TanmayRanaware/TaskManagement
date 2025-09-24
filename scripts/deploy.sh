#!/bin/bash

# TaskManagement Deployment Script
# This script deploys the TaskManagement application to AWS ECS Fargate

set -e

# Configuration
AWS_REGION="us-east-1"
ECR_REPOSITORY="taskmanagement"
ECS_CLUSTER="taskmanagement-cluster"
ECS_SERVICE="taskmanagement-service"
TASK_DEFINITION_FAMILY="taskmanagement"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install it first."
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed. Please install it first."
        exit 1
    fi
    
    log_info "All dependencies are installed."
}

# Build and push Docker images
build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    ECR_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPOSITORY}"
    
    # Login to ECR
    log_info "Logging in to ECR..."
    aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_URI}
    
    # Build and push server image
    log_info "Building server image..."
    docker build -t ${ECR_URI}/server:latest -f server/Dockerfile server/
    docker push ${ECR_URI}/server:latest
    
    # Build and push web image
    log_info "Building web image..."
    docker build -t ${ECR_URI}/web:latest -f web/Dockerfile web/
    docker push ${ECR_URI}/web:latest
    
    log_info "Images pushed successfully."
}

# Update ECS service
update_ecs_service() {
    log_info "Updating ECS service..."
    
    # Get current task definition
    CURRENT_TASK_DEF=$(aws ecs describe-task-definition --task-definition ${TASK_DEFINITION_FAMILY} --query taskDefinition)
    
    # Create new task definition with updated images
    NEW_TASK_DEF=$(echo $CURRENT_TASK_DEF | jq --arg serverImage "${ECR_URI}/server:latest" --arg webImage "${ECR_URI}/web:latest" '
        .containerDefinitions[0].image = $serverImage |
        .containerDefinitions[1].image = $webImage |
        del(.taskDefinitionArn) |
        del(.revision) |
        del(.status) |
        del(.requiresAttributes) |
        del(.placementConstraints) |
        del(.compatibilities) |
        del(.registeredAt) |
        del(.registeredBy)
    ')
    
    # Register new task definition
    NEW_TASK_DEF_ARN=$(echo $NEW_TASK_DEF | aws ecs register-task-definition --cli-input-json file:///dev/stdin --query taskDefinition.taskDefinitionArn --output text)
    
    # Update ECS service
    aws ecs update-service \
        --cluster ${ECS_CLUSTER} \
        --service ${ECS_SERVICE} \
        --task-definition ${NEW_TASK_DEF_ARN} \
        --force-new-deployment
    
    log_info "ECS service updated successfully."
}

# Wait for deployment to complete
wait_for_deployment() {
    log_info "Waiting for deployment to complete..."
    
    aws ecs wait services-stable \
        --cluster ${ECS_CLUSTER} \
        --services ${ECS_SERVICE}
    
    log_info "Deployment completed successfully!"
}

# Main deployment function
main() {
    log_info "Starting TaskManagement deployment..."
    
    check_dependencies
    build_and_push_images
    update_ecs_service
    wait_for_deployment
    
    log_info "Deployment completed successfully!"
    log_info "Application is now running on ECS Fargate."
}

# Run main function
main "$@"
