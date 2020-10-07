<?php

namespace App\Entity;

use Symfony\Component\Validator\Constraints as Assert;

use Symfony\Component\HttpFoundation\File\File;

class PostImage
{

	/**
	 * @Assert\Image(
	 *      maxSize = "10Mi",
	 *      allowLandscape = false,
	 *      allowLandscapeMessage = "The picture must be square",
	 *      allowPortrait = false
	 * )
	 */
	private $image;

	public function __construct(File $image)
	{
		$this->setImage($image);
	}

	public function setImage(File $file = null)
	{
		$this->image = $file;
	}

	public function getImage()
	{
		return $this->image;
	}

}
