<?php

namespace App\Repository;

use App\Entity\Favorite;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Favorite|null find($id, $lockMode = null, $lockVersion = null)
 * @method Favorite|null findOneBy(array $criteria, array $orderBy = null)
 * @method Favorite[]    findAll()
 * @method Favorite[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class FavoriteRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, Favorite::class);
	}

	/**
	 * @return ?int Returns nb of favorites for a post
	 */
	public function getNbPostFavorites($postId){
		return (int) $this->createQueryBuilder('f')
			->select('count(f.id)')
			->andWhere('f.post = :post_id')
			->setParameter('post_id', $postId)
			->getQuery()
			->getSingleScalarResult()
		;
	}

	/**
	 * @return ?bool Returns if post is liked by user
	 */
	public function isFavByUser($postId, $userId){
		return (boolean) $this->createQueryBuilder('f')
			->select('count(f.id)')
			->join('f.user', 'u')
			->andWhere('f.post = :post_id')
			->setParameter('post_id', $postId)
			->andWhere('f.user = :user_id')
			->setParameter('user_id', $userId)
			->getQuery()
			->getSingleScalarResult()
		;
	}

	/**
	 * @return ?void Toggle fav for a post/user
	 */
	public function toggleFav($post, $user){
		if($fav = $this->findOneBy(['post' => $post, 'user' => $user])){
			$this->_em->remove($fav);
		}
		else{
			$fav = new Favorite();
			$fav->setUser($user);
			$fav->setPost($post);
			$this->_em->persist($fav);
		}
		$this->_em->flush();
	}

	/**
	 * @return ?void Gets all users that liked a post
	 */
	public function getFavoritesUsersFromPost($post){
		return $this->createQueryBuilder('f')
			->select('u.id', 'u.email', 'u.username')
			->join('f.user', 'u')
			->andWhere('f.post = :post')
			->setParameter('post', $post)
			->orderBy('f.id', 'DESC')
			->getQuery()
			->getArrayResult()
		;
	}
	// /**
	//  * @return Favorite[] Returns an array of Favorite objects
	//  */
	/*
	public function findByExampleField($value)
	{
		return $this->createQueryBuilder('l')
			->andWhere('l.exampleField = :val')
			->setParameter('val', $value)
			->orderBy('l.id', 'ASC')
			->setMaxResults(10)
			->getQuery()
			->getResult()
		;
	}
	*/

	/*
	public function findOneBySomeField($value): ?Favorite
	{
		return $this->createQueryBuilder('l')
			->andWhere('l.exampleField = :val')
			->setParameter('val', $value)
			->getQuery()
			->getOneOrNullResult()
		;
	}
	*/
}
