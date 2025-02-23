import 'dotenv/config'
import 'reflect-metadata'

import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { join } from 'path';

import { APP_BOOT_CONTEXT } from './app.constants'
import { AppModule } from './app.module'
import { WelcomeModule } from './modules/welcome/welcome.module'
import { Logger } from './helpers/Logger'

async function bootstrap() {

	const logger = new Logger()
	logger.status()
	let app

	if(!process.env.DATABASE_URI) {
		app = await NestFactory.create<NestExpressApplication>(WelcomeModule)
		app.useStaticAssets(join(__dirname, '..', 'public'));
  		app.setBaseViewsDir(join(__dirname, '..', 'views'));
		app.setViewEngine('hbs');
	}else{
		app = await NestFactory.create<NestExpressApplication>(AppModule)
	}
	
	app.enableCors()
	await app.listen(process.env.PORT ?? 3000)

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
		}),
	)

	let url = await app.getUrl()
	url = url.replace('[::1]', 'localhost')
	logger.log(`Application is running on: ${url}`, APP_BOOT_CONTEXT)

	if (process.env.TZ) {
		logger.log(`Timezone is set to: ${process.env.TZ}. Current time: ${new Date()}`, APP_BOOT_CONTEXT)
	}
}
bootstrap()
