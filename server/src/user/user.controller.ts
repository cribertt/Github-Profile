import { Controller, Get, Param } from '@nestjs/common';
import { UserService, GithubProfile } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':username')
  async getUser(@Param('username') username: string): Promise<GithubProfile> {
    return this.userService.getUserProfile(username);
  }
}
