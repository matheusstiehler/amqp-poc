FROM eclipse-temurin:11-jdk

WORKDIR /app

COPY target/consumer-1.0-SNAPSHOT-jar-with-dependencies.jar /app/app.jar

# Expose the port your app runs on
EXPOSE 5672

# Run the project
CMD ["java", "-jar", "/app/app.jar"]