<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;


class AppController extends AbstractController
{
	/**
	* @Route("/{reactRouting}", name="index", requirements={"reactRouting"="^(?!api)(?!admin).+"}, defaults={"reactRouting": null})
	*/
	public function index(Request $request)
	{
		// used if user just validated his email
		$userValidated 	= $request->query->get('user_validated');

		// used to access the password edit form 
		$passwordToken 	= $request->query->get('password_token');
		$email 			= $request->query->get('email');

		// used when connexion admin expired
		$connexion_expired 	= $request->query->get('connexion_expired');

		return $this->render('base.html.twig', [
			'user_validated' 	=> $userValidated,
			'password_token' 	=> $passwordToken,
			'email' 			=> $email,
			'connexion_expired'	=> $connexion_expired,
		]);
	}

	/**
	* @Route("/admin/{reactRouting}", name="admin", requirements={"reactRouting"="^.+"}, defaults={"reactRouting": null})
	*/
	public function admin(Request $request)
	{
		return $this->render('admin.html.twig');
	}

}
