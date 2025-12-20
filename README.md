# CureIt

# Running the Project

Use Java version 21

NOTE: For ease of development, the JAR files are compiled locally, and then copied to docker containers to be run

```sh
# Compile all SpringBoot projects
cd interaction-service && mvn clean package && cd .. 
cd user-service && mvn clean package && cd ..
cd content-processing && mvn clean package && cd ..

# Run the entirety of the project
docker compose up -d

# In case some services failed (will be resolved later) due to late connection to kafka, rerun the above command once again
```
