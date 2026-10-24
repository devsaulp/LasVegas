# Imagen base ligera de Nginx sobre Alpine Linux
FROM nginx:alpine

# Metadatos del contenedor
LABEL maintainer="Licorería Las Vegas <devsaul>"
LABEL description="Contenedor web estático para Licorería Las Vegas"

# Copiar archivos del proyecto al directorio web de Nginx
COPY . /usr/share/nginx/html

# Exponer puerto HTTP
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
