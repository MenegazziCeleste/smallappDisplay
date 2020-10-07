<?php

namespace App\Service;

use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class Mailer
{
	private $session;
	private $mailer;


	public function __construct(SessionInterface $session, MailerInterface $mailer){
		$this->session = $session;
		$this->mailer  = $mailer;
	}

	private function createToken($email){
		return md5(uniqid($email, true));
	}

	public function sendValidation($email, $domain)
	{
		$this->session->start();
		$token = $this->createToken($email);
		$this->session->set('validate-token-' . $email , $token);

		$validateUrl = 'https://' . $domain . ':8000/api/login/validate?email=' . urlencode($email) . '&validate_token=' . urlencode($token);

		$sendingEmail = (new TemplatedEmail())
				->from('choose.ur@mail.Com')
				->to($email)
				->subject('Please validate your mail')
				->htmlTemplate('emails/signup.html.twig')
				->context([
					'url' => $validateUrl,
				]);
		$this->mailer->send($sendingEmail);
	}

	public function sendPasswordLink($email, $domain)
	{
		$this->session->start();
		$token = $this->createToken($email);
		$this->session->set('password-token-' . $email , $token);

		$validateUrl = 'https://' . $domain . ':8000/password?email=' . urlencode($email) . '&password_token=' . urlencode($token);

		$sendingEmail = (new TemplatedEmail())
				->from('choose.ur@mail.Com')
				->to($email)
				->subject('Small App password change')
				->htmlTemplate('emails/changepassword.html.twig')
				->context([
					'url' => $validateUrl,
				]);
				
		$this->mailer->send($sendingEmail);
	}
}