FROM maven:3.9.4-eclipse-temurin-21
WORKDIR /app
COPY . .
RUN mvn dependency:resolve
CMD ["mvn", "spring-boot:run", "-Dserver.port=${PORT}"]
