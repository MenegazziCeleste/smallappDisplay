<?php

namespace App\Entity;

// use App\Entity\Tag;
use App\Repository\PostRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass=PostRepository::class)
 */
class Post
{
	/**
	 * @ORM\Id()
	 * @ORM\GeneratedValue()
	 * @ORM\Column(type="integer")
	 */
	private $id;

	/**
	 * @ORM\Column(type="string", length=25)
	 * @Assert\NotBlank(
	 *      message = "Title cannot be blank")
	 * @Assert\Length(
	 *      max = 25,
	 *      maxMessage = "The post title cannot be longer than {{ limit }} characters",
	 *      normalizer = "trim"
	 * )
	 */
	private $title;

	/**
	 * @ORM\Column(type="text", nullable=true)
	 * @Assert\Length(
	 *      max = 3000,
	 *      maxMessage = "The post text cannot be longer than {{ limit }} characters",
	 *      normalizer = "trim"
	 * )
	 */
	private $text;

	/**
	 * @ORM\ManyToMany(targetEntity=Tag::class, inversedBy="posts")
	 * @ORM\JoinColumn(nullable=false)
	 */
	private $tags;


	public function __construct()
	{
		$this->tags = new ArrayCollection();
	}

	public function getId(): ?int
	{
		return $this->id;
	}

	public function getTitle(): ?string
	{
		return $this->title;
	}

	public function setTitle(?string $title): self
	{
		$this->title = $title;

		return $this;
	}

	public function getText(): ?string
	{
		return $this->text;
	}

	public function setText(?string $text): self
	{
		$this->text = $text;

		return $this;
	}

	/**
	 * @return Collection|Tag[]
	 */
	public function getTags(): Collection
	{
		return $this->tags;
	}

	public function addTag(Tag $tag): self
	{
		if (!$this->tags->contains($tag)) {
			$this->tags[] = $tag;
		}

		return $this;
	}

	public function removeTag(Tag $tag): self
	{
		if ($this->tags->contains($tag)) {
			$this->tags->removeElement($tag);
		}

		return $this;
	}

	public function getNbFavorites(): ?int
	{
		return $this->nbFavorites;
	}

	public function setNbFavorites(?int $nbFavorites): self
	{
		$this->nbFavorites = $nbFavorites;
		return $this;
	}

	public function getNbComments(): ?int
	{
		return $this->nbComments;
	}

	public function setNbComments(?int $nbComments): self
	{
		$this->nbComments = $nbComments;
		return $this;
	}

	public function getFavByUser(): ?bool
	{
		return $this->favByUser;
	}

	public function setFavByUser(?bool $favByUser): self
	{
		$this->favByUser = $favByUser;
		return $this;
	}

	public function getImages($path){
		if(!$this->getId()) return null;

		$path = $path . "post_" . $this->getId();
		
		if(!file_exists($path)) return [];
		
		$directoryContent = scandir($path);
		$images = [];
		foreach ($directoryContent as $file) {
			if(file_exists($path . '/' . $file) && is_file($path . '/' . $file)) $images[] = '/images/posts/post_' . $this->getId() . '/' . $file;
		}
		return $images;
	}
}
