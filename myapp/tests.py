from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token
from .models import Transaction
from django.contrib.auth.models import User

class TransactionTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpassword')
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')

        self.transaction1 = Transaction.objects.create(text='Transaction 1', amount=100)
        self.transaction2 = Transaction.objects.create(text='Transaction 2', amount=-50)

    def test_transaction_creation(self):
        self.assertEqual(self.transaction1.text, 'Transaction 1')
        self.assertEqual(self.transaction1.amount, 100)
        self.assertEqual(self.transaction2.text, 'Transaction 2')
        self.assertEqual(self.transaction2.amount, -50)

    def test_transaction_list_view(self):
        response = self.client.get(reverse('transaction-list'))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Transaction 1')
        self.assertContains(response, 'Transaction 2')

    def test_transaction_detail_view(self):
        response = self.client.get(reverse('transaction-detail', args=[self.transaction1.id]))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Transaction 1')
        self.assertNotContains(response, 'Transaction 2')

    def test_add_transaction_view(self):
        data = {'text': 'New Transaction', 'amount': 75}
        response = self.client.post(reverse('transaction-list'), data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Transaction.objects.last().text, 'New Transaction')

    def test_delete_transaction_view(self):
        response = self.client.delete(reverse('transaction-detail', args=[self.transaction2.id]))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Transaction.objects.filter(id=self.transaction2.id).exists())

    def test_user_authentication(self):
        response = self.client.post(reverse('token_obtain_pair'), {'username': 'testuser', 'password': 'testpassword'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('token', response.data)

    def test_unauthorized_access(self):
        self.client.credentials()  # Clear credentials
        response = self.client.get(reverse('transaction-list'))
        self.assertEqual(response.status_code, 401)


    def test_error_handling(self):
        response = self.client.get('/invalid-url/')
        self.assertEqual(response.status_code, 404)
