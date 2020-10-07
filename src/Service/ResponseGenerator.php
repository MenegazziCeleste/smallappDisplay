<?php

namespace App\Service;

use Symfony\Component\HttpFoundation\JsonResponse;

class ResponseGenerator
{
	public function getSuccessResponse($data = [])
	{
		return new JsonResponse([
						'status'    => 'success',
						'data'      => $data
					]);
	}

	public function getFailResponse($message = "Action failed")
	{
		return new JsonResponse([
						'status'    => 'fail',
						'error'      => $message
					]);
	}
}