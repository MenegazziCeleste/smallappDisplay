<?php

namespace App\Service;

use App\Repository\CommentRepository;
use App\Repository\FavoriteRepository;
use App\Service\Uploader;

class PostService
{

	private $commentRepository;
	private $favoriteRepository;
	private $imagesRelativeDirectory;
	private $imagesAbsoluteDirectory;

	public function __construct(CommentRepository $commentRepository, 
								FavoriteRepository $favoriteRepository,
								string $imagesRelativeDirectory,
								string $imagesAbsoluteDirectory){
		$this->commentRepository        = $commentRepository;
		$this->favoriteRepository       = $favoriteRepository;
		$this->imagesRelativeDirectory  = $imagesRelativeDirectory;
		$this->imagesAbsoluteDirectory  = $imagesAbsoluteDirectory;
	}

	public function updatePost($post, $getImages = false, $userId = false, $nbFav = false, $nbCom = false){
		$tags = [];
		foreach ($post->getTags() as $tag) {
			$tags[] = [ 'id'    => $tag->getId(),
						'name'  => $tag->getName()];
		}
		$updatedPost = [
				'id'            => $post->getId(),
				'title'         => $post->getTitle(),
				'text'          => $post->getText(),
				'nbFavorites'   => $nbFav !== false ? $nbFav : $this->favoriteRepository->getNbPostFavorites($post->getId()),
				'nbComments'    => $nbCom !== false ? $nbCom : $this->commentRepository->getNbPostComments($post->getId()),
				'tags'          => $tags
			];
		if($userId){
			$updatedPost['favByUser'] = $this->favoriteRepository->isFavByUser($post->getId(), $userId);
		}
		if($getImages){
			$updatedPost['images'] = $post->getImages($this->imagesRelativeDirectory);
		}

		return $updatedPost;
	}

	public function updatePosts($posts, $userId = false, $getImages = false){
		$updatedPosts = [];
		foreach ($posts as $post) {
			$updatedPosts[] = $this->updatePost($post[0], $userId, $getImages, $post['nbFavorites'], $post['nbComments']);
		}
		return $updatedPosts;
	}

	private function getSortedImagesFileNamesFromPaths($postId, $imagesPaths){
		$sortedImages = array_map(function ($imagePath) use ($postId) {
							$imageName = str_replace("/" . $this->imagesRelativeDirectory . "post_" . $postId . "/", "", $imagePath);
							$arrayImageName = explode("__", $imageName);

							// handle new data from request
							if(count($arrayImageName) == 3){
								return ['index'             => $arrayImageName[2],
										'nameWithoutIndex'  => $arrayImageName[1], 
										'fullName'          => $arrayImageName[0] . '__' . $arrayImageName[1]];
							// handle current image data from path
							}else if (count($arrayImageName) == 2){
								return ['index'             => $arrayImageName[0],
										'nameWithoutIndex' => $arrayImageName[1], 
										'fullName' => $imageName];
							}else{
								return false;  
							}  
						}, $imagesPaths);
		return in_array(false, $sortedImages) ? false : $sortedImages;
	}


	// Gets previous images path and old images remaining from request with new order,
	// Deletes images not longer in the post 
	// Change name images that changed their order
	// Probably should be handled in db
	public function handleExistingImages($post, $images){
		$pathPost = $this->imagesAbsoluteDirectory . "post_" . $post->getId() . "/";

		$previousImages = $post->getImages($this->imagesRelativeDirectory);
		$previousImages = $this->getSortedImagesFileNamesFromPaths($post->getId(), $previousImages);

		$sortedImages = $images ? $this->getSortedImagesFileNamesFromPaths($post->getId(), $images) : [];

		if($previousImages === false || $sortedImages === false) return false;

		if($sortedImages != $previousImages){

			foreach ($previousImages as $previousImage) {
				$notDeletedImage = array_filter($sortedImages, 
										function ($sortedImage) use ($previousImage){ 
											return $previousImage['nameWithoutIndex'] == $sortedImage['nameWithoutIndex']; 
										});
				if(!$sortedImages || !$notDeletedImage){
					$path = $pathPost . $previousImage['fullName'];
					if(!file_exists($path) || !unlink($path)) return false;
				}
			}

			if($sortedImages){
				foreach ($sortedImages as $index => $sortedImage) {
					$newPath = $pathPost . $index . '__' . $sortedImage['nameWithoutIndex'];
					$oldPath = $pathPost . $sortedImage['fullName'];

					if(!file_exists($newPath) && file_exists($oldPath)){
						if(!rename($oldPath, $newPath)) return false;
					}
				}
			}
		}
		return true;
	}
}