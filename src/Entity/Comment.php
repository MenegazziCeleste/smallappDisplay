<?php

namespace App\Entity;

use App\Repository\PostUserRepository;
use Doctrine\ORM\Mapping as ORM;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass=CommentRepository::class)
 */
class Comment
{
	/**
	 * @ORM\Id()
	 * @ORM\GeneratedValue()
	 * @ORM\Column(type="integer")
	 */
	private $id;

	/**
	 * @ORM\ManyToOne(targetEntity=Post::class)
	 * @ORM\JoinColumn(nullable=false, onDelete="CASCADE")
	 */
	private $post;

	/**
	 * @ORM\ManyToOne(targetEntity=user::class)
	 * @ORM\JoinColumn(nullable=false)
	 */
	private $user;


	/**
	 * @ORM\Column(type="text")
	 * @Assert\NotBlank(
	 *		message = "Comments cannot be blank")
	 * @Assert\Length(
	 * 		max = 2000,
	 * 		maxMessage = "Comments cannot be longer than {{ limit }} characters",
	 * 		normalizer = "trim"
	 * )
	 */
	private $comment;

	/**
	 * @ORM\Column(type="datetime")
	 */
	private $time;


	public function getId(): ?int
	{
		return $this->id;
	}

	public function getPost(): ?Post
	{
		return $this->post;
	}

	public function setPost(?Post $post): self
	{
		$this->post = $post;

		return $this;
	}

	public function getUser(): ?user
	{
		return $this->user;
	}

	public function setUser(?user $user): self
	{
		$this->user = $user;

		return $this;
	}

	public function getComment(): ?string
	{
		return $this->comment;
	}

	public function setComment(?string $comment): self
	{
		$this->comment = $comment;

		return $this;
	}

	public function getTime(): ?\DateTimeInterface
	{
		return $this->time;
	}

	public function setTime(\DateTimeInterface $time): self
	{
		$this->time = $time;

		return $this;
	}

}
