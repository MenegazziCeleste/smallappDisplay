<?php

namespace App\Service;

// use App\Entity\PostImage;
use Symfony\Component\HttpFoundation\File\Exception\FileException;

class Uploader
{

	private $postDirectory;

	public function __construct($postDirectory){
		$this->postDirectory = $postDirectory;
	}

	public function getPostDirectory(){
		return $this->postDirectory;
	}

	public function uploadPostImage($image, $postId, $numberImage){
		$image = $image->getImage();
		$index = intval($image->getClientOriginalName());
		$newFilename = $index . '__' . $numberImage . uniqid() . "." . $image->guessExtension();
		$path = $this->getPostDirectory() . 'post_' . $postId;
		
		try {
			$image->move(
				$path,
				$newFilename
			);
		} catch (FileException $e) {
			return $e->getMessage();
		}
	}

}