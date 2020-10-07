<?php

namespace App\DataFixtures;

use App\Entity\Post;
use App\Entity\Tag;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class PostFixtures extends Fixture
{

	public const NUMBER_POSTS    = 50;
	public const POST_REFERENCE  = 'post-';

	public function load(ObjectManager $manager)
	{
		$tagNames = [
			'tag',
			'avgtag',
			'longer tag',
			'very long tag',
			'nospacelongtag'
		];

		$tags = [];
		for ($i=0; $i < count($tagNames); $i++) { 
			$tag = new Tag();
			$tag->setName($tagNames[$i]);
			$manager->persist($tag);
			$tags[] = $tag;
		}


		$postTitles = [
		'Normal Title ',
		'Another normal title ',
		"It's the max title size"];

		$postTexts = [
			'A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text. A very long post text.',
			'A small post text',
			'An average post text, just explaining some stuff without writing a novel. An average post text, just explaining some stuff without writing a novel. An average post text, just explaining some stuff without writing a novel.',
		];

		for ($i=1; $i <= self::NUMBER_POSTS; $i++) { 
			$post = new Post();
			$post->setTitle($postTitles[rand(0,2)] . $i);
			$post->setText($postTexts[rand(0,2)]);

			// add a random number of randoms tags
			for ($j=0; $j < rand(1,count($tags)); $j++) { 
				$post->addTag($tags[rand(0,count($tags) - 1)]);
			}
			$manager->persist($post);

			$this->addReference(self::POST_REFERENCE . $i, $post);
		}

		$manager->flush();
	}
}
