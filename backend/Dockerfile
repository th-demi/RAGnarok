# Base image
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .

RUN pip install --upgrade pip \
    && pip install -r requirements.txt

# Copy project code
COPY . .

# Expose backend port
EXPOSE 8000

# Start FastAPI with Uvicorn
CMD ["uvicorn", "apps.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]