<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Lexik\Bundle\JWTAuthenticationBundle\Security\User\JWTUserInterface;

use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;

/**
 * @ORM\Entity(repositoryClass=UserRepository::class)
 * @UniqueEntity(
 *     fields={"email"},
 *     message="This email is already in use."
 * )
 */
class User implements JWTUserInterface
{
	/**
	 * @ORM\Id()
	 * @ORM\GeneratedValue()
	 * @ORM\Column(type="integer")
	 */
	private $id;

	/**
	 * @ORM\Column(type="string", length=180, unique=true)
	 * @Assert\Email(
	 *     message = "The email '{{ value }}' is not a valid email.",
	 *     normalizer = "trim"
	 * )
	 */
	private $email;

	/**
	 * @ORM\Column(type="json")
	 */
	private $roles = [];

	/**
	 * @var string The hashed password
	 * 
	 * ADD CONSTRAINTS ON PASSWORD
	 *
	 * @ORM\Column(type="string")
	 */
	private $password;   

	/**
	 * @ORM\Column(type="string", length=25, nullable=true)
	 * @Assert\Length(
	 *      max = 25,
	 *      maxMessage = "Your username cannot be longer than {{ limit }} characters",
	 *      normalizer = "trim"
	 * )
	 */
	private $username;

	/**
	 * @ORM\Column(type="boolean")
	 */
	private $validated;

	/**
	 * @ORM\Column(type="boolean")
	 */
	private $disabled;

	public function __construct()
	{
		$this->favorites = new ArrayCollection();
	}

	public function getId(): ?int
	{
		return $this->id;
	}

	public function getEmail(): ?string
	{
		return $this->email;
	}

	public function setEmail(string $email): self
	{
		$this->email = $email;

		return $this;
	}

	/**
	 * A visual identifier that represents this user.
	 *
	 * @see UserInterface
	 */
	public function getUsername(): string
	{
		return (string) $this->username;
	}

	/**
	 * @see UserInterface
	 */
	public function getRoles(): array
	{
		$roles = $this->roles;
		// guarantee every user at least has ROLE_USER
		$roles[] = 'ROLE_USER';

		return array_unique($roles);
	}

	public function setRoles(array $roles): self
	{
		$this->roles = $roles;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getPassword(): string
	{
		return (string) $this->password;
	}

	public function setPassword(string $password): self
	{
		$this->password = $password;

		return $this;
	}

	/**
	 * @see UserInterface
	 */
	public function getSalt()
	{
		// not needed when using the "bcrypt" algorithm in security.yaml
	}

	/**
	 * @see UserInterface
	 */
	public function eraseCredentials()
	{
		// If you store any temporary, sensitive data on the user, clear it here
		// $this->plainPassword = null;
	}

	public function setUsername(?string $username): self
	{
		$this->username = $username;

		return $this;
	}

	public function getValidated(): ?bool
	{
		return $this->validated;
	}

	public function setValidated(bool $validated): self
	{
		$this->validated = $validated;

		return $this;
	}
	
	public static function createFromPayload($email, array $payload)
	{
		return new self();
	}

	public function getDisabled(): ?bool
	{
		return $this->disabled;
	}

	public function setDisabled(bool $disabled): self
	{
		$this->disabled = $disabled;

		return $this;
	}

}
