<?php if (!defined('BASEPATH')) exit('No direct script access allowed');
/**
 * Anmeldung anzeigen und verarbeiten.
 *
 * @package		eridian
 * @subpackage	Controllers
 * @category	Controllers
 * @author      Mathias Latzko <mathias.latzko@googlemail.com>
 * @extends     controller
 * @see 		parent::Controller()
 */

class Ocr extends CI_Controller
{

	protected $salt = array();

	/**
	 * Constructor Controller
	 */
	function Ocr()
	{

		parent::__construct();
		$this->load->model('users');
		$this->load->model('user');
		$this->load->model('category');
		$this->load->model('categories');
		$this->load->model('send_mail');
		$this->salt = $this->config->item('salt');
	}

	/**
	 * Anmeldeseite anzeigen und Ergebniss verarbeiten.
	 * @return string
	 *
	 * @uses Form_Validation
	 * @uses Input
	 * @uses dohash()
	 * @uses view()
	 */
	function index()
	{
		
		$data = array();
		$data['parseData'] = init_ParseData();
		$data['parseData']['login:errors'] = '';


		$data['benutzername'] = '';
		$data['passwort'] = '';

		if(!empty($_POST)){

			$this->form_validation->set_error_delimiters('<div class="formerror">', '</div>');

			$this->form_validation->set_rules('benutzername', 'Benutzername', 'required|trim|strip_tags');
			$this->form_validation->set_rules('passwort', 'Passwort', 'required|trim|strip_tags');

			if ($this->form_validation->run() !== FALSE)
			{
				
			

				$where = array(
					'cu_email' => $this->input->post('benutzername'),
					'cu_pass' => do_hash($this->input->post('passwort'), 'md5'),
				);
				$user = $this->user->get($where);

				if($user !== FALSE && $user['cu_rights'] !== '-1' && $user['cu_rights'] !== '-2')
				{
					$this->session->set_userdata('user', $user['cu_id']);
					$this->session->set_userdata('user_firstN', $user['cu_firstname']);
					$this->session->set_userdata('user_lastN', $user['cu_lastname']);
					$this->session->set_userdata('user_kdnr', $user['cu_kdnr']);
					$update_data['is_open'] = 0;
					$this->category->update(array('cc_cu_id' => $user['cu_id']),$update_data);
					
					$cookie_ocrn= "ocr";
					$cookie_ocrv= "1";
					
					setcookie($cookie_ocrn,$cookie_ocrv, time() + (86400 * 30), "/"); 
					
					redirect('ocr/main');
				} else {
					$data['parseData']['login:errors'] = '<div class="formerror">Ihre Anmeldung wurde nicht akzeptiert, bitte geben Sie Ihre Anmeldedaten erneut ein.</div>';
				}
			}
		}


		view(__CLASS__.'/'.__FUNCTION__, $data);
	

	}

	function main()
	{
		


		if (!empty($_COOKIE['ocr'])){
			
			$this->load->view('ocr/home.php');
			}else{
				redirect('ocr/index');
			}
		
	}

	
	
}
