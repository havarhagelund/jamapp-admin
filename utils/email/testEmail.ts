import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_KEY);

resend.emails.send({
  from: 'onboarding@resend.dev',
  to: 'havar@grovegrove.no',
  subject: 'Hello World',
  html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});