<?php

namespace App\Repository;

use App\Entity\Comment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use \Datetime;

/**
 * @method Comment|null find($id, $lockMode = null, $lockVersion = null)
 * @method Comment|null findOneBy(array $criteria, array $orderBy = null)
 * @method Comment[]    findAll()
 * @method Comment[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CommentRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, Comment::class);
	}

	/**
	* @return ?int Returns nb of comments for a post
	*/
	public function getNbPostComments($postId){
		return (int) $this->createQueryBuilder('c')
			->select('count(c.id)')
			->andWhere('c.post = :post_id')
			->setParameter('post_id', $postId)
			->andWhere('c.comment IS NOT NULL')
			->getQuery()
			->getSingleScalarResult()
		;
	}


	/**
	 * @return Comment[] Returns an array of Comment objects
	 */
	
	public function getPostComments($post)
	{
		return $this->createQueryBuilder('c')
			->select('c.id', 'c.comment', 'c.time', 'u.email', 'u.username')
			->andWhere('c.post = :post')
			->setParameter('post', $post)
			->join('c.user', 'u')
			->orderBy('c.id', 'ASC')
			->getQuery()
			->getResult()
		;
	}
	
	public function createComment($user, $post, $commentText){
		$comment = new Comment();
		$comment->setUser($user);
		$comment->setPost($post);
		$comment->setComment($commentText);
		$comment->setTime(new Datetime());
		return $comment; 
	}

	public function save($comment){
		$this->_em->persist($comment);
		$this->_em->flush();
	}

	public function delete($comment){
		$this->_em->remove($comment);
		$this->_em->flush();
	}
	/*
	public function findOneBySomeField($value): ?Comment
	{
		return $this->createQueryBuilder('p')
			->andWhere('p.exampleField = :val')
			->setParameter('val', $value)
			->getQuery()
			->getOneOrNullResult()
		;
	}
	*/
}
