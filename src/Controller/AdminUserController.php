<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

// DB
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;

use Symfony\Component\HttpFoundation\Request;

// Custom services
use App\Service\ResponseGenerator;
use App\Service\JsonDataExtrator;
use App\Service\Validator;


/**
 * @Route("/api/admin/user", name="admin_user_")
 */
class AdminUserController extends AbstractController
{

	private $userRepository;
	private $rg;
	private $jde;
	private $validator;

	public function __construct(
								UserRepository $userRepository, 
								ResponseGenerator $rg, 
								JsonDataExtrator $jde,
								Validator $validator
								){
		$this->userRepository   = $userRepository;
		$this->rg 				= $rg;
		$this->jde 				= $jde;
		$this->validator 		= $validator;
	}

	/**
	* @Route("/list", name="list")
	*/
	public function getUsers(Request $request)
	{
		$data = $this->jde->getDataFromRequest($request, ['page', 'filters', 'sort']);
		$page 		= $data['page'] ? $data['page'] : 1;
		$filters 	= $data['filters'] ? $data['filters'] : false;
		$sort 		= $data['sort'] ? $data['sort'] : false;

		$queryResult = $this->userRepository->findAllUsers($page, $filters, $sort);

		return $this->rg->getSuccessResponse([	"users" 	=> $queryResult["users"], 
												"page" 		=> $queryResult["page"], 
												"nbUsers" 	=> $queryResult["nbUsers"]]);
	}

	/**
	* @Route("/list/filter", name="list_filter")
	*/
	public function getUsersForFilters()
	{
		$queryResult = $this->userRepository->findAll();

		$users = [];
		foreach ($queryResult as $user) {
			$users[] = ['id' => $user->getId(),
						'username' => $user->getUsername() ? $user->getUsername() : $user->getEmail()];
		}
		return $this->rg->getSuccessResponse(["users" => $users]);
	}

	/**
	 * @Route("/edit/password/{id}", name="edit_password", requirements={"id"="\d+"})
	 */
	public function editPasswordUser($id, Request $request)
	{
		
		$data = $this->jde->getDataFromRequest($request, ['new_password']);

		if(!$data || !$data['new_password']){
			return $this->rg->getFailResponse('Invalid data.');
		}

		if(!$user = $this->userRepository->find($id)){
			return $this->rg->getFailResponse('Invalid user.');
		}

		$user = $this->userRepository->setNewPassword($user, $data['new_password']);
		
		if($invalidMessage = $this->validator->isInvalid($user)){
			return $this->rg->getFailResponse($invalidMessage);	
		} 
		
		$this->userRepository->save($user);

		return $this->rg->getSuccessResponse($user);
	}

	/**
	 * @Route("/edit/{id}", name="create_edit", requirements={"id"="\d+|new"})
	 */
	public function createOrEditUser($id, Request $request)
	{
		if($id == "new"){
			$data = $this->jde->getDataFromRequest($request, ['email', 'username', 'password', 'validated', 'admin']);

			if($this->userRepository->findOneByEmail($data["email"])){
				return $this->rg->getFailResponse('Email already used.');
			}

			$user = $this->userRepository->createNewUser($data['email'], $data['password']);
			$data["disabled"] = false;
			
		}else{
			$user = $this->userRepository->find($id);
			$data = $this->jde->getDataFromRequest($request, ['username', 'validated', 'disabled', 'admin']);
		}
		
		if(!$data){
			return $this->rg->getFailResponse('Invalid data.');
		}
		if(!$user){
			return $this->rg->getFailResponse('Invalid user.');
		}

		$user->setUsername(trim($data["username"]));
		
		// Prevents current admin from disconnecting themselves or losing rights		
		if($this->getUser() != $user){

			$user->setValidated($data["validated"] ? true : false);
			$user->setDisabled($data["disabled"] ? true : false);
			
			if($data["admin"] == 1 && !in_array("ROLE_ADMIN", $user->getRoles())){
				$user->setRoles(["ROLE_ADMIN"]);
			}else if($data["admin"] == 0 && in_array("ROLE_ADMIN", $user->getRoles())){
				$user->setRoles([]);
			}
		}
		
		if($invalidMessage = $this->validator->isInvalid($user)){
			return $this->rg->getFailResponse($invalidMessage);	
		}
		
		$this->userRepository->save($user);

		return $this->rg->getSuccessResponse($user);
	}

}
