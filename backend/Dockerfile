# Estágio de Build
FROM maven:3.9.6-eclipse-temurin-21-jammy AS build
WORKDIR /app
COPY pom.xml .
# Baixa as dependências offline para acelerar builds subsequentes
RUN mvn dependency:go-offline

# Copia o código fonte e compila o pacote ignorando testes
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio de Execução (Imagem mais leve)
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# A porta que o Render/Koyeb vai usar (o seu application.yml espera a env PORT, por padrão 8080)
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
