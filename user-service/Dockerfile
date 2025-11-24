FROM eclipse-temurin:25-jdk
WORKDIR /app
COPY target/user-service-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "/app/app.jar", "--server.port=${PORT:-4003}"]
