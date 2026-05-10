import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { digestQueueName } from './digest.queue';
import { DigestService } from './digest.service';
import { EmailService } from '@libs/shared';

@Processor(digestQueueName.name)
export class DigestProcessor extends WorkerHost {
  constructor(
    private readonly digestService: DigestService,
    private readonly emailService: EmailService,
  ) {
    super();
  }
  async process(job: Job) {
    if (job.name === digestQueueName.task.emailDigest) {
      const { text, email } = job.data;
      await this.emailService.sendEmail(email, '今日学习总结', text);
      // console.log(`Processing email digest for user ${userId} `);
    }
    if (job.name === digestQueueName.task.everyDayDigest) {
      await this.digestService.handleEmailDigest();
      console.log(`Processing every day digest `);
    }
  }
}
