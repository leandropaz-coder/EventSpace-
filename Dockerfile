FROM ubuntu:latest
LABEL authors="estag"

ENTRYPOINT ["top", "-b"]
FROM maven:3.9.8-eclipse-temurin-21-jammy AS builder

WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/aulajovem2026IA-0.0.1-SNAPSHOT.jar .

EXPOSE 8080

ENTRYPOINT ["java","-jar", "aulajovem2026IA-0.0.1-SNAPSHOT.jar"]