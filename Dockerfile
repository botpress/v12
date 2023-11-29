FROM --platform=linux/amd64 ubuntu:20.04

# Set environment variables
ENV BP_WORKDIR=/botpress
ENV BP_USER=botpress
ENV BP_GROUP=botpress
ENV BP_DATA_PATH $BP_WORKDIR/data

# Set the DEBIAN_FRONTEND environment variable to non-interactive
ENV DEBIAN_FRONTEND=noninteractive

# Set the timezone to your desired value (e.g., UTC)
RUN ln -fs /usr/share/zoneinfo/UTC /etc/localtime

# Install dependencies & node.js
RUN apt-get update && apt-get install -y curl g++ make curl \
    gnupg chromium-browser git
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs

# Install yarn
RUN npm install -g yarn

# Set working directory
WORKDIR $BP_WORKDIR

# Copy the rest of the code
COPY . .

# Install dependencies
RUN yarn install

# Build the application
RUN yarn build

# Start the application
CMD ["yarn", "start"]