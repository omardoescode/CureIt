FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY target/interaction-service-0.0.1-SNAPSHOT.jar app.jar

ENTRYPOINT ["sh", "-c", "java -jar /app/app.jar --server.port=${PORT:-4004}"]
