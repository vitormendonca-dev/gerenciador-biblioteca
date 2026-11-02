from django.db import models

class Livro(models.Model):
    titulo = models.CharField(max_length=255)
    autor = models.CharField(max_length=255)
    capa = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.titulo