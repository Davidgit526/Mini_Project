FROM node:20

WORKDIR /node

# COPY wait-for-it.sh .
# RUN chmod +x wait-for-it.sh

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

 # Adjust the port to match your MongoDB container
CMD [ "node", "node.js"] 
