# a docker file is like a blueprint for a container. It tells docker how to build the container. The container is a running instance of the image and it is the container that runs the application.

# start with a base image. In our case we start with node:18 which is built on top of a linux image
FROM node:18

# Set the working directory in the container /app
WORKDIR /app

# Copy the package.json and package-lock.json files from the current directory to the /app directory in the container
COPY package*.json ./

# install ffmpeg in the container
RUN apt-get update && apt-get install -y ffmpeg

# install the dependencies in the container (needed packages specified in package.json)
RUN npm install

# Copy the rest of the files from the current directory to the /app directory in the container 
COPY . .

# Expose the port 3000 in the container
EXPOSE 3000

# Run the application in the container
CMD ["npm", "start"]