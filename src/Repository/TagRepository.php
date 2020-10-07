<?php

namespace App\Repository;

use App\Entity\Tag;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Tag|null find($id, $lockMode = null, $lockVersion = null)
 * @method Tag|null findOneBy(array $criteria, array $orderBy = null)
 * @method Tag[]    findAll()
 * @method Tag[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TagRepository extends ServiceEntityRepository
{
	public function __construct(ManagerRegistry $registry)
	{
		parent::__construct($registry, Tag::class);
	}

	/**
	 * @return Tag[] Returns an array of Tag objects
	 */
	public function findAllTags()
	{
		return $this->createQueryBuilder('t')
					->select('t.id', 't.name')
					->orderBy('t.id', 'DESC')
					->getQuery()
					->getResult();
	}

	/**
	 * Sort functions
	 */
	private function setIdSort($query, $order){
		return $query->orderBy('t.id', $order);
	}
	private function setNameSort($query, $order){
		return $query->orderBy('t.name', $order);
	}

	/**
	 * @return Tag[] Returns an array of Tag objects
	 */
	public function adminFindAllTags($search = "", $sort = [])
	{   
		// build the query for the doctrine paginator
		$query = $this->createQueryBuilder('t');         

		if($search){
			 $query->andWhere('t.name LIKE :search')
				->setParameter('search', '%' . $search . '%');
		}
		if($sort){
			foreach ($sort as $sort => $order) {
				if(in_array($order, ["ASC", "DESC"])){
					$method = 'set' . ucfirst($sort) . 'Sort';
					$query = $this->$method($query, $order);    
				}
			}
		}else{
			$query = $query->orderBy('t.id', 'DESC');
		}

		$tags = $query->getQuery()->getArrayResult();

		// you can get total items
		$totalItems = count($tags);

		$results = ["tags"     => $tags, 
					"nbTags"   => $totalItems];

		return $results;
	}

	public function save($tag)
	{
		$this->_em->persist($tag);
		$this->_em->flush();
	}

	public function delete($tag)
	{
		$this->_em->remove($tag);
		$this->_em->flush();
		return true;
	}

	// /**
	//  * @return Tag[] Returns an array of Tag objects
	//  */
	/*
	public function findByExampleField($value)
	{
		return $this->createQueryBuilder('t')
			->andWhere('t.exampleField = :val')
			->setParameter('val', $value)
			->orderBy('t.id', 'ASC')
			->setMaxResults(10)
			->getQuery()
			->getResult()
		;
	}
	*/

	/*
	public function findOneBySomeField($value): ?Tag
	{
		return $this->createQueryBuilder('t')
			->andWhere('t.exampleField = :val')
			->setParameter('val', $value)
			->getQuery()
			->getOneOrNullResult()
		;
	}
	*/
}
