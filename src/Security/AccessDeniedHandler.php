<?php 
namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Authorization\AccessDeniedHandlerInterface;

class AccessDeniedHandler implements AccessDeniedHandlerInterface
{
	public function handle(Request $request, AccessDeniedException $accessDeniedException)
	{
		// hide admin to non admin users
		if($request->headers->get('type') != "axios"){
			return new RedirectResponse("/");
		}
	}
}