<?php

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

use App\Entity\Comment;
use App\Entity\Favorite;

use App\DataFixtures\UserFixtures;
use App\DataFixtures\PostFixtures;

use \Datetime;

use Doctrine\Common\DataFixtures\DependentFixtureInterface;

class FavoriteAndCommentFixtures extends Fixture implements DependentFixtureInterface
{
	public const NUMBER_FAVS        = 100;
	public const NUMBER_COMMENTS    = 100;

	public function getDependencies()
	{
		return array(
			UserFixtures::class,
			PostFixtures::class,
		);
	}

	private function getRandomEntity($nbEntity, $refEntity){
		$rdmNumber = rand(1, $nbEntity);
		return $this->getReference($refEntity . $rdmNumber);
	}

	public function load(ObjectManager $manager)
	{

		$userRef = UserFixtures::USER_REFERENCE;
		$postRef = PostFixtures::POST_REFERENCE;
		$nbUsers = UserFixtures::NUMBER_USERS;
		$nbPosts = PostFixtures::NUMBER_POSTS;       


		for ($i=1; $i <= self::NUMBER_FAVS; $i++) { 
			$fav = new Favorite();

			$fav->setUser($this->getRandomEntity($nbUsers, $userRef));
			$fav->setPost($this->getRandomEntity($nbPosts, $postRef));

			$manager->persist($fav);
		}

		$commentTexts = [
			'This is a short comment',
			'This is a a longer comment. This is a a longer comment. This is a a longer comment. This is a a longer comment. This is a a longer comment. This is a a longer comment.',
			'This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella. This is a comment novella.'
		];

		for ($i=1; $i <= self::NUMBER_COMMENTS; $i++) { 
			$comment = new Comment();

			$comment->setUser($this->getRandomEntity($nbUsers, $userRef));
			$comment->setPost($this->getRandomEntity($nbPosts, $postRef));

			$comment->setComment($commentTexts[rand(0,2)]);
			$comment->setTime(new DateTime());
			$manager->persist($comment);
		}

		$manager->flush();
	}
}
