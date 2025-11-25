from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.utils import timezone
from django.db.models import Q
from .models import Todo
from .forms import TodoForm
from django.http import JsonResponse
from django.template.loader import render_to_string

class TodoListView(ListView):
    model = Todo
    template_name = 'tasks/todo_list.html'
    context_object_name = 'todos'

    def get_queryset(self):
        queryset = Todo.objects.all()
        
        # Search
        search_query = self.request.GET.get('search', '')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) | 
                Q(description__icontains=search_query)
            )
            
        # Filter
        filter_status = self.request.GET.get('filter', '')
        today = timezone.now().date()
        
        if filter_status == 'today':
            queryset = queryset.filter(due_date__date=today)
        elif filter_status == 'overdue':
            queryset = queryset.filter(due_date__lt=timezone.now(), status='PENDING')
            
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        todos = self.get_queryset()
        
        context['pending_todos'] = todos.filter(status='PENDING').order_by('due_date')
        context['completed_todos'] = todos.filter(status='RESOLVED').order_by('-updated_at')
        
        # Due soon (next 24 hours)
        tomorrow = timezone.now() + timezone.timedelta(days=1)
        context['due_soon_todos'] = todos.filter(
            status='PENDING',
            due_date__lte=tomorrow,
            due_date__gte=timezone.now()
        )
        
        # Stats
        total = todos.count()
        completed = todos.filter(status='RESOLVED').count()
        context['progress'] = int((completed / total) * 100) if total > 0 else 0
        
        return context

class TodoCreateView(CreateView):
    model = Todo
    form_class = TodoForm
    success_url = reverse_lazy('todo_list')
    template_name = 'tasks/todo_form_modal.html'

    def form_valid(self, form):
        self.object = form.save()
        if self.request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success'})
        return redirect(self.success_url)
    
    def form_invalid(self, form):
        if self.request.headers.get('x-requested-with') == 'XMLHttpRequest':
            # Return the form HTML with errors
            html = render_to_string(self.template_name, {'form': form}, request=self.request)
            return JsonResponse({'status': 'error', 'html': html}, status=400)
        return super().form_invalid(form)

class TodoUpdateView(UpdateView):
    model = Todo
    form_class = TodoForm
    success_url = reverse_lazy('todo_list')
    template_name = 'tasks/todo_form_modal.html'

    def form_valid(self, form):
        self.object = form.save()
        if self.request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success'})
        return redirect(self.success_url)
    
    def form_invalid(self, form):
        if self.request.headers.get('x-requested-with') == 'XMLHttpRequest':
            # Return the form HTML with errors
            html = render_to_string(self.template_name, {'form': form}, request=self.request)
            return JsonResponse({'status': 'error', 'html': html}, status=400)
        return super().form_invalid(form)

class TodoDeleteView(DeleteView):
    model = Todo
    success_url = reverse_lazy('todo_list')
    
    def delete(self, request, *args, **kwargs):
        self.object = self.get_object()
        self.object.delete()
        if request.headers.get('x-requested-with') == 'XMLHttpRequest':
            return JsonResponse({'status': 'success'})
        return redirect(self.success_url)

def toggle_status(request, pk):
    todo = get_object_or_404(Todo, pk=pk)
    if todo.status == 'PENDING':
        todo.status = 'RESOLVED'
    else:
        todo.status = 'PENDING'
    todo.save()
    return redirect('todo_list')