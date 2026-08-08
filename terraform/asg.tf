data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_launch_template" "k3s_backend" {
  name_prefix   = "cka-simulator-"
  image_id      = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  vpc_security_group_ids = [aws_security_group.cka_simulator_sg.id]
  
  user_data = filebase64("${path.module}/install_k3s.sh")

  iam_instance_profile {
    name = aws_iam_instance_profile.ssm_profile.name
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "CKA-Simulator-K3s-ASG"
    }
  }
}

resource "aws_lb" "backend_alb" {
  name               = "cka-simulator-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.cka_simulator_sg.id]
  subnets            = data.aws_subnets.default.ids
  idle_timeout       = 3600
}

resource "aws_lb_target_group" "backend_tg" {
  name     = "cka-simulator-tg"
  port     = 3001
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  health_check {
    path                = "/"
    port                = 3001
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 10
  }
}

resource "aws_lb_listener" "backend_listener" {
  load_balancer_arn = aws_lb.backend_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}

resource "aws_autoscaling_group" "backend_asg" {
  name                      = "cka-simulator-asg"
  max_size                  = 5
  min_size                  = 1
  desired_capacity          = 1
  vpc_zone_identifier       = data.aws_subnets.default.ids
  target_group_arns         = [aws_lb_target_group.backend_tg.arn]
  health_check_type         = "ELB"
  health_check_grace_period = 300

  launch_template {
    id      = aws_launch_template.k3s_backend.id
    version = "$Latest"
  }
}

resource "aws_autoscaling_policy" "cpu_tracking" {
  name                   = "cka-simulator-cpu-tracking"
  autoscaling_group_name = aws_autoscaling_group.backend_asg.name
  policy_type            = "TargetTrackingScaling"

  target_tracking_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ASGAverageCPUUtilization"
    }
    target_value = 50.0
  }
}
