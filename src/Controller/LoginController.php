<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

// Calls for lougout
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\NullOutput;
use Symfony\Component\HttpKernel\KernelInterface;

// DB
use App\Repository\UserRepository;


// Custom services
use App\Service\ResponseGenerator;
use App\Service\JsonDataExtrator;
use App\Service\Mailer;
use App\Service\Validator;



/**
 * @Route("/api/login", name="login_")
 */
class LoginController extends AbstractController
{

	private $userRepository;
	private $rg;
	private $jde;
	private $validator;

	public function __construct(
								UserRepository $userRepository, 
								SessionInterface $session,
								ResponseGenerator $rg, 
								JsonDataExtrator $jde,
								Validator $validator
								){
		$this->userRepository 	= $userRepository;
		$this->session 			= $session;
		$this->rg 				= $rg;
		$this->jde 				= $jde;
		$this->validator 		= $validator;
	}



	/**
	 * @Route("/create", name="create_user")
	 */
	public function createUser(Request $request, Mailer $mailer)
	{
		$data = $this->jde->getDataFromRequest($request, ['email', 'password']);
		
		if(!$user = $this->userRepository->findOneByEmail($data['email'])){
			
			$user = $this->userRepository->createNewUser($data['email'], $data['password']);
			$user->setValidated(false);
			$user->setDisabled(false);
			
			if($invalidMessage = $this->validator->isInvalid($user)){
				return $this->rg->getFailResponse($invalidMessage);	
			}
			
			$mailer->sendValidation($data['email'], $request->getHost());
			
			$this->userRepository->save($user);
			
		}
		
		// not indicating fail to avoid indicating whether the account exists
		return $this->rg->getSuccessResponse();
		
	}

	/**
	 * @Route("/validate", name="validate_user")
	 */
	public function validateUser(Request $request)
	{
		$this->session->start();
		$email = $request->query->get('email');
		$token = $request->query->get('validate_token');
		$user  = $this->userRepository->findOneByEmail($email);

		$validated = false;

		if($token && $user && $token == $this->session->get('validate-token-' . $email, false)){
			$user->setValidated(true);
			$this->userRepository->save($user);
			$validated = true;

		}else if($user->getValidated()){
			$validated = true;
		}
		
		$this->session->remove('validate-token-' . $email);

		return $this->redirectToRoute('index', ['user_validated' => $validated]);
	}
	
	/**
	 * @Route("/log_out", name="log_out")
	 */
	public function logOut(KernelInterface $kernel, Request $request)
	{
		$response = new JsonResponse();
		$response->headers->clearCookie('BEARER');
		$response->headers->clearCookie('refresh_token');
		$response->headers->clearCookie('connected');

		$refreshToken = $request->cookies->get('refresh_token');
		if($refreshToken){
			$application = new Application($kernel);
			$application->setAutoExit(false);

			$input = new ArrayInput([
				'command' => 'gesdinet:jwt:revoke',
				'refresh_token' => $refreshToken
			]);
			$output = new NullOutput();
			$application->run($input, $output);
		}		

		return $response;
	}

	/**
	 * @Route("/password/send_edit_link", name="send_edit_password_link")
	 */
	public function sendEditPasswordLink(Request $request, Mailer $mailer)
	{

		$data = $this->jde->getDataFromRequest($request, ['email']);
		$user = $data ? $this->userRepository->findOneByEmail($data['email']) : false;

		if($user && !$user->getDisabled()){
			$mailer->sendPasswordLink($user->getEmail(), $request->getHost());
		}

		// not indicating fail to avoid indicating whether the account exists
		return $this->rg->getSuccessResponse();
	}

	/**
	 * @Route("/password/edit", name="edit_password")
	 */
	public function editPassword(Request $request)
	{
		$this->session->start();

		$data = $this->jde->getDataFromRequest($request, ['email', 'password_token', 'new_password']);
		$user = $this->userRepository->findOneByEmail($data['email']);

		if(!$user || !$data){
			return $this->rg->getFailResponse('Invalid link, please try again');
		}
		if(!$data['new_password']){
			return $this->rg->getFailResponse('Invalid data');
		}

		if( $data['password_token'] != $this->session->get('password-token-' . $user->getEmail(), false)){
			return $this->rg->getFailResponse('Invalid token');	
		}
		
		$user = $this->userRepository->setNewPassword($user, $data['new_password']);
		
		if($invalidMessage = $this->validator->isInvalid($user)){
			return $this->rg->getFailResponse($invalidMessage);	
		}
		
		$this->userRepository->save($user);
		
		$this->session->remove('password-token-' . $user->getEmail());

		return $this->rg->getSuccessResponse();
		
	}
}
