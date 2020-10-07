<?php

namespace App\Repository;

use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Security\Core\Exception\UnsupportedUserException;
use Symfony\Component\Security\Core\User\PasswordUpgraderInterface;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Doctrine\ORM\Tools\Pagination\Paginator;

/**
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository implements PasswordUpgraderInterface
{
	private $passwordEncoder;

	public function __construct(ManagerRegistry $registry, UserPasswordEncoderInterface $passwordEncoder)
	{
		$this->passwordEncoder = $passwordEncoder;
		parent::__construct($registry, User::class);
	}

	/**
	 * Used to upgrade (rehash) the user's password automatically over time.
	 */
	public function upgradePassword(UserInterface $user, string $newEncodedPassword): void
	{
		if (!$user instanceof User) {
			throw new UnsupportedUserException(sprintf('Instances of "%s" are not supported.', \get_class($user)));
		}

		$user->setPassword($newEncodedPassword);
		$this->_em->persist($user);
		$this->_em->flush();
	}



	/**
	 * Filter functions
	 */
	private function setSearchFilter($query, $value){
		$query->andWhere('u.id LIKE :search OR u.email LIKE :search OR u.username LIKE :search');
		$value = "%" . $value . "%";

		return $query->setParameter('search', $value);
	}

	private function setBoolFilter($query, $value, $filter){
		$query->andWhere('u.'.$filter.' = :'.$filter);
		$value = $value ? 1 : 0;

		return $query->setParameter($filter, $value);
	}

	private function setValidatedFilter($query, $value){
		return $this->setBoolFilter($query, $value, 'validated');
	}

	private function setDisabledFilter($query, $value){
		return $this->setBoolFilter($query, $value, 'disabled');
	}

	private function setAdminFilter($query, $value){
		$query->andWhere('u.roles = :admin');
		$value = $value ? '["ROLE_ADMIN"]' : '[]';

		return $query->setParameter('admin', $value);
	}

	/**
	 * Sort functions
	 */
	private function setIdSort($query, $order){
		return $query->orderBy('u.id', $order);
	}
	private function setEmailSort($query, $order){
		return $query->orderBy('u.email', $order);
	}
	private function setUsernameSort($query, $order){
		return $query->orderBy('u.username', $order);
	}
	/**
	 * @return User[] Returns an array of User objects
	 */
	public function findAllUsers($page = 1, $filters = [], $sort = [])
	{

		// build the query for the doctrine paginator
		$query = $this->createQueryBuilder('u');            

		if($filters){
			foreach ($filters as $filter => $value) {
				if($value !== ""){
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
			$query = $query->orderBy('u.id', 'ASC');
		}

		$query = $query->getQuery();

		//set page size
		$pageSize = 5;

		// load doctrine Paginator
		$results = new Paginator($query);

		// you can get total items
		$totalItems = count($results);

		// get total pages
		$pagesCount = ceil($totalItems / $pageSize);

		// checks if page is valid
		$page = ($page > 0 && $page <= $pagesCount) ? $page : 1;

		// now get one page's items:
		$users = $results
					->getQuery()
					->setFirstResult($pageSize * ($page-1)) // set the offset
					->setMaxResults($pageSize) // set the limit
					->getArrayResult(); 

		if($users){
			foreach ($users as $key => $user) {
				$users[$key]['username'] = (string) $user['username'];
				$users[$key]['admin']    = in_array("ROLE_ADMIN", $user["roles"]);
			}
		}
		return ["users"     => $users,
				"page"      => $page,
				"nbUsers"   => $totalItems]; 
	}

	public function createNewUser($email, $password){
		$user = new User();
		$user->setEmail($email);
		$password = $this->passwordEncoder->encodePassword(
				$user,
				$password
			);
		$user->setPassword($password);
		return $user;
	}

	public function setNewPassword($user, $password){
		$password = $this->passwordEncoder->encodePassword(
				$user,
				$password
			);
		return $user->setPassword($password);
	}

	public function save($user){
		$this->_em->persist($user);
		$this->_em->flush();
	}
	// /**
	//  * @return User[] Returns an array of User objects
	//  */
	/*
	public function findByExampleField($value)
	{
		return $this->createQueryBuilder('u')
			->andWhere('u.exampleField = :val')
			->setParameter('val', $value)
			->orderBy('u.id', 'ASC')
			->setMaxResults(10)
			->getQuery()
			->getResult()
		;
	}
	*/

	/*
	public function findOneBySomeField($value): ?User
	{
		return $this->createQueryBuilder('u')
			->andWhere('u.exampleField = :val')
			->setParameter('val', $value)
			->getQuery()
			->getOneOrNullResult()
		;
	}
	*/
}
