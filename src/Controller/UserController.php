<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Component\HttpFoundation\Request;

// DB
use App\Repository\UserRepository;

// Custom services
use App\Service\ResponseGenerator;
use App\Service\JsonDataExtrator;
use App\Service\Mailer;
use App\Service\Validator;


/**
 * @Route("/api/user", name="user_")
 */
class UserController extends AbstractController
{

	private $rg;
	private $jde;
	private $userRepository;

	public function __construct(
								ResponseGenerator $rg, 
								JsonDataExtrator $jde, 
								UserRepository $userRepository
								){
		$this->rg 				= $rg;
		$this->jde 				= $jde;
		$this->userRepository 	= $userRepository;
	}

	/**
	 * @Route("", name="info")
	 */
	public function getUserInfo()
	{
		$usertmp = $this->getUser();

		$user = [
			"id" 		=> $usertmp->getId(),
			"email" 	=> $usertmp->getEmail(),
			"username" 	=> $usertmp->getUsername(),
			"roles" 	=> $usertmp->getRoles(),
		];
		return $this->rg->getSuccessResponse($user);
	}

	/**
	 * @Route("/edit", name="edit")
	 */
	public function editUser(Request $request, Validator $validator)
	{
		$user  		= $this->getUser();
		$data 		= $this->jde->getDataFromRequest($request, ['username']);
		$username 	= trim($data['username']);

		if(!$user){
			return $this->rg->getFailResponse('invalid user');
		}

		$user->setUsername($username);
			
		if($invalidMessage = $validator->isInvalid($user)){
			return $this->rg->getFailResponse($invalidMessage);	
		}

		$this->userRepository->save($user);

		return $this->rg->getSuccessResponse($user);
	}

}
