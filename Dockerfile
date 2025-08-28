# Dockerfile

FROM node:18

# Set working directory
WORKDIR /rlcc-assistant-api-service

COPY .sequelizerc ./

# Copy and install dependencies
COPY package.json ./
RUN npm install



# Copy the rest of the app
COPY . .

RUN npm install -g nodemon

# Expose port
EXPOSE 3000 9229

# Run the app
# CMD ["npm", "run", "dev"]