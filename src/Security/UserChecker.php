<?php

namespace App\Security;

use App\Entity\User as AppUser;
use Symfony\Component\Security\Core\Exception\AccountExpiredException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

use Symfony\Component\HttpFoundation\RequestStack;
use App\Service\Mailer;


class UserChecker implements UserCheckerInterface
{

	protected $request;
	protected $mailer;

	public function __construct(RequestStack $requestStack, Mailer $mailer){
		$this->request    = $requestStack->getCurrentRequest();
		$this->mailer  = $mailer;
	}

	public function checkPreAuth(UserInterface $user)
	{
		if (!$user instanceof AppUser) {
			return;
		}
		
		// remove access to disabled users
		if ($user->getDisabled()) {
			throw new CustomUserMessageAccountStatusException('Your user account no longer exists.');
		}

		// remove access to unvalidated users
		if (!$user->getValidated()){
			// sends the validation email if they try to log in
			if($this->request->getPathInfo() == "/api/login_check"){
				$this->mailer->sendValidation($user->getEmail(), $this->request->getHost());
				throw new CustomUserMessageAccountStatusException('Please validate your email adress.');
			}else{
				throw new CustomUserMessageAccountStatusException('Your account is not validated.');
			}   
		}
	}

	public function checkPostAuth(UserInterface $user)
	{
	}
}