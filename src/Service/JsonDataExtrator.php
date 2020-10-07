<?php

namespace App\Service;

use App\Service\ResponseGenerator;


class JsonDataExtrator
{
	private $rg;


	public function __construct(ResponseGenerator $rg){
		$this->rg = $rg;
	}

	public function getDataFromRequest($request, array $params = [])
	{
		$data = json_decode($request->getContent(), true);
		$isValid = true;

		foreach ($params as $param) {
			$isValid &= isset($data[$param]);
		}
		return $isValid ? $data : false;
	}

	public function getDataFromForm($request, array $params = [])
	{
		$data = [];
		$isValid = true;

		foreach ($params as $param) {
			$newData = $request->request->get($param);
			$isValid &= $newData !== null;
			$data[$param] = $newData;
		}
		return $isValid ? $data : false;
	}

	public function getFilesFromForm($request, array $params = [])
	{
		$data = [];
		$isValid = true;
		
		foreach ($params as $param) {
			$newData = $request->files->get($param);

			$isValid &= $newData !== null;
			$data[$param] = $newData;
		}
		return $isValid ? $data : false;
	}
}