<?php

namespace App\Service;

use Symfony\Component\Validator\Validator\ValidatorInterface;

class Validator
{

	private $validator;

	public function __construct(ValidatorInterface $validator){
		$this->validator  = $validator;
	}

	public function isInvalid($entity){
		$errors = $this->validator->validate($entity);
		if (count($errors) > 0) {
			$message = "";
			foreach ($errors as $error) {
				$message .= "<br />" . $error->getMessage();
			}
			return $message;
		}
		return false;
	}
}