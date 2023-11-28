FROM ubuntu:20.04

# Set environment variables
ENV BP_WORKDIR=/botpress
ENV BP_USER=botpress
ENV BP_GROUP=botpress
ENV BP_DATA_PATH $BP_WORKDIR/data

# Install dependencies
RUN dpkg --add-architecture arm64 && \
    apt-get update && \
    apt-get install -y chromium-browser:arm64

# Install curl and Node.js
RUN apt-get update && apt-get install -y curl g++ make ca-certificates curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs

# Install yarn
RUN npm install -g yarn

# Set working directory
WORKDIR $BP_WORKDIR

# Copy package.json and yarn.lock files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy the rest of the code
COPY . .

# Build the application
RUN yarn build

# Start the application
CMD ["yarn", "start"]