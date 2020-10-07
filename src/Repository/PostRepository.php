<?php

namespace App\Repository;

use App\Entity\Post;
use App\Entity\Favorite;
use App\Entity\Comment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @method Post|null find($id, $lockMode = null, $lockVersion = null)
 * @method Post|null findOneBy(array $criteria, array $orderBy = null)
 * @method Post[]    findAll()
 * @method Post[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PostRepository extends ServiceEntityRepository
{
	private $postUserRepo;

	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, Post::class);
	}

	/**
	 * Filter functions
	 */
	private function setSearchFilter($query, $value){
		$query->andWhere('p.id LIKE :search OR p.title LIKE :search OR p.text LIKE :search');
		$value = "%" . $value . "%";

		return $query->setParameter('search', $value);
	}

	private function setTagsFilter($query, $tags){
		foreach($tags as $key => $tag) {
			$query->join('p.tags', 't' . $key)
				->andWhere('t'. $key . '.id = :tag'. $key)
				->setParameter('tag'. $key, $tag);
		}
		return $query;
	}

	private function setFavoriteFilter($query, $users){
		foreach($users as $key => $user) {
			$query->join(Favorite::class, 'f' . $key, \Doctrine\ORM\Query\Expr\Join::WITH, 'p = f'. $key .'.post')
				->andWhere('f'. $key .'.user = :userfavid'. $key)
				->setParameter('userfavid'. $key, $user);
		}
		return $query;
	}

	private function setCommentFilter($query, $users){
		foreach($users as $key => $user) {
			$query->join(Comment::class, 'c' . $key, \Doctrine\ORM\Query\Expr\Join::WITH, 'p = c'. $key .'.post')
				->andWhere('c'. $key .'.user = :usercomid'. $key)
				->setParameter('usercomid'. $key, $user);
		}
		return $query;
	}

	/**
	 * Sort functions
	 */
	private function setIdSort($query, $order){
		return $query->orderBy('p.id', $order);
	}
	private function setTitleSort($query, $order){
		return $query->orderBy('p.title', $order);
	}
	private function setFavoriteSort($query, $order){
		return $query->orderBy('nbFavorites', $order);
	}
	private function setCommentSort($query, $order){
		return $query->orderBy('nbComments', $order);
	}
	private function setCommentTimeSort($query, $order){
		return $query->orderBy('MAX(c.time)', $order);
	}

	/**
	 * @return Post[] Returns an array of Post objects
	 */
	public function findAllPosts($page = 1, $filters = [], $sort = [], $admin = false)
	{
		//set page size
		$pageSize = 12;

		if($admin){
			$pageSize = 5;
		}

		// build the query for the doctrine paginator
		$query = $this->createQueryBuilder('p')
			->addSelect('count(DISTINCT f) as nbFavorites', 'count(DISTINCT c) as nbComments')
			->groupBy('p.id')
			->leftJoin(Favorite::class, 'f', 'WITH', 'p = f.post')
			->leftJoin(Comment::class, 'c', 'WITH', 'p = c.post')
			;

		if($filters){
			foreach ($filters as $filter => $value) {
				if($value){
					$method = 'set' . ucfirst($filter) . 'Filter';
					$query = $this->$method($query, $value);    
				} 
			}
		}
		if($sort){
			foreach ($sort as $sort => $order) {
				if(in_array($order, ["ASC", "DESC"])){
					$method = 'set' . ucfirst($sort) . 'Sort';
					$query = $this->$method($query, $order);    
				}
			}
		}else{
			$query = $query->orderBy('p.id', 'ASC');
		}
		$query = $query->getQuery();

		// load doctrine Paginator
		$posts = new Paginator($query, $fetchJoinCollection = true);

		// you can get total items
		$totalItems = count($posts);

		// get total pages
		$pagesCount = ceil($totalItems / $pageSize);

		// checks if page is valid
		$page = ($page > 0 && $page <= $pagesCount) ? $page : 1;

		// now get one page's items:
		$posts = $posts
					->getQuery()
					->setFirstResult($pageSize * ($page-1)) // set the offset
					->setMaxResults($pageSize) // set the limit
					->getResult();

		$hasMore = $totalItems - ($page * $pageSize) > 0;

		$results = ["posts"     => $posts, 
					"hasMore"   => $hasMore,
					"nbPosts"   => $totalItems,
					"page"      => $page];

		return $results; 
	}
	public function save($post)
	{
		$this->_em->persist($post);
		$this->_em->flush();
	}

	// check whether a tag is used alone in a post, making it undeletable, and the posts preventing the delete
	public function postsWithOnlyThisTag($tagId){
		$result = $this->createQueryBuilder('p')
			->select('p.id')
			->join('p.tags', 't1')
			->join('p.tags', 't2')
			->having('count(DISTINCT t1.id) = 1')
			->andWhere('t2.id = :tag_id')
			->setParameter('tag_id', $tagId)
			->groupBy('p.id')
			->getQuery()
			->getResult()
		;
		$result = array_map(function ($post){return $post['id'];}, $result);
		return $result;
	}


	 public function delete($post)
	{
		$this->_em->remove($post);
		$this->_em->flush();
	}
	// /**
	//  * @return Post[] Returns an array of Post objects
	//  */
	/*
	public function findByExampleField($value)
	{
		return $this->createQueryBuilder('p')
			->andWhere('p.exampleField = :val')
			->setParameter('val', $value)
			->orderBy('p.id', 'ASC')
			->setMaxResults(10)
			->getQuery()
			->getResult()
		;
	}
	*/

	/*
	public function findOneBySomeField($value): ?Post
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
