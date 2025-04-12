import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  console.log(process.env.NGROK_AUTHTOKEN)
  await app.listen(process.env.PORT ?? 3000);
  // const session = await new SessionBuilder().authtokenFromEnv().connect();
  // const Listener = await session.httpEndpoint().listen();
  // new Logger('main').log(`Ingress established at ${Listener.url()}`);
  // Listener.forward(`localhost:${process.env.PORT ?? 3000 }`);
}
bootstrap();
