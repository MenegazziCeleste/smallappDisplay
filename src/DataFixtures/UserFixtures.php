<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\Persistence\ObjectManager;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;

class UserFixtures extends Fixture
{
	private $passwordEncoder;
	public const NUMBER_USERS    = 50;
	public const USER_REFERENCE  = 'user-';

	public function __construct(UserPasswordEncoderInterface $passwordEncoder)
	{
		$this->passwordEncoder = $passwordEncoder;
	}

	public function load(ObjectManager $manager)
	{
		for ($i=1; $i < self::NUMBER_USERS ; $i++) { 
			$user = new User();
			$user->setEmail('test' . $i . '@smallapp.com');
			$user->setPassword($this->passwordEncoder->encodePassword(
				$user,
				'lala'
			));
			$user->setValidated(rand(0,1));
			$user->setDisabled(rand(0,1));
			$manager->persist($user);

			$this->addReference(self::USER_REFERENCE . $i, $user);
		}

		$admin = new User();
		$admin->setEmail('admin@smallapp.com');
		$admin->setPassword($this->passwordEncoder->encodePassword(
			$admin,
			'lala'
		));
		$admin->setRoles(["ROLE_ADMIN"]);
		$admin->setValidated(true);
		$admin->setDisabled(false);

		$manager->persist($admin);

		$this->addReference(self::USER_REFERENCE . self::NUMBER_USERS, $admin);

		$manager->flush();
	}
}
